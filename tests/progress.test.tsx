import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'task-progress',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: true },
} as const

test('the bar fills as tasks are created and completed', async ($, on) => {
  let next = 1
  on('tool.call', (_, e) => {
    if (e.tool === 'TaskCreate') {
      const id = String(next++)
      return { result: { task: { id, subject: e.subject } } }
    }
    if (e.tool === 'TaskUpdate') {
      return { result: { success: true, taskId: e.taskId, updatedFields: ['status'] } }
    }
    return { result: {} }
  })

  for (const subject of ['Plan', 'Build', 'Test', 'Ship']) {
    await $.tool.call({ tool: 'TaskCreate', subject, description: subject })
  }
  await $.tool.call({ tool: 'TaskUpdate', taskId: '1', status: 'completed' })
  await $.tool.call({ tool: 'TaskUpdate', taskId: '2', status: 'in_progress' })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /tasks/ }))?.text).toBe(' 1/4 tasks · 25%')
    expect((await ui.find({ type: 'Text', text: /▸/ }))?.text).toBe('▸ Build')
    await ui.unmount()
  }

  await $.tool.call({ tool: 'TaskUpdate', taskId: '4', status: 'deleted' })
  for (const id of ['2', '3']) {
    await $.tool.call({ tool: 'TaskUpdate', taskId: id, status: 'completed' })
  }
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /tasks/ }))?.text).toBe(' 3/3 tasks · 100%')
  await ui.unmount()
})

test('no tasks, no band', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
  await ui.unmount()
})
