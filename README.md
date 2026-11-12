# task-progress

A Claude Code mod that shows a live progress bar above the prompt for the session's task list. As Claude creates, starts and finishes tasks, the bar fills and shows the count, the percentage and the task in progress:

```
██████████░░░░░░░░░░ 2/4 tasks · 50%
▸ Build the settings page
```

The bar is cyan while work is under way and turns green with a **Clear** button when every task is done. Deleted tasks drop out of the count. With no tasks, nothing is shown. No setup or configuration is needed.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install task-progress --marketplace dpoGit/claude-task-progress
```

Answer `y` to add the marketplace, then press Enter to pick the user scope.

From a shell:

```bash
claude plugin install task-progress --marketplace dpoGit/claude-task-progress
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `dpoGit/claude-task-progress`, then **Add plugin**.

## Notes

- Tasks created before the mod loads appear the next time Claude lists the task list.
- Run the tests with `claude plugin test .`
