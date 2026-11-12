import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Task } from '../types'

const tasks = atom({ plugin: 'task-progress', key: 'tasks' } as const, [] as Task[])

const WIDTH = 20

function bar(done: number, total: number): string {
  const filled = total === 0 ? 0 : Math.round((done / total) * WIDTH)
  return '█'.repeat(filled) + '░'.repeat(WIDTH - filled)
}

export const register: Register = on => {
  on('tool.call', { tool: 'TaskCreate' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      const t = ran.result.task
      const added: Task = { id: t.id, subject: t.subject, status: 'pending' }
      await update($, tasks, list => [...list.filter(x => x.id !== t.id), added])
    }
    return ran
  })

  on('tool.call', { tool: 'TaskUpdate' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true && ran.result.success) {
      const status = e.status
      await update($, tasks, list =>
        status === 'deleted'
          ? list.filter(x => x.id !== e.taskId)
          : list.map(
              (x): Task =>
                x.id === e.taskId
                  ? { ...x, subject: e.subject ?? x.subject, status: status ?? x.status }
                  : x,
            ),
      )
    }
    return ran
  })

  // TaskList returns the full, authoritative list: resync from it.
  on('tool.call', { tool: 'TaskList' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      await update($, tasks, () =>
        ran.result.tasks.map(t => ({ id: t.id, subject: t.subject, status: t.status })),
      )
    }
    return ran
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, tasks)
    if (e.props.hasSurvey || list.length === 0) return next(e)

    const total = list.length
    const done = list.filter(t => t.status === 'completed').length
    const current = list.find(t => t.status === 'in_progress')
    const pct = Math.round((done / total) * 100)
    const isDone = done === total
    const { Box, Text, Button } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Box>
          <Text color={isDone ? 'green' : 'cyan'}>{bar(done, total)}</Text>
          <Text>
            {' '}
            {done}/{total} tasks · {pct}%
          </Text>
          {isDone ? (
            <Button key="clear" label="Clear" onPress={() => update($, tasks, () => [])} />
          ) : null}
        </Box>
        {current ? <Text dimColor>▸ {current.subject}</Text> : null}
      </Box>
    )
  })
}
