# Documenting changes

Nearing merge of your new feature or bugfix, you should use `changeset` to write
documentation for the release notes.

```
$ pnpm changeset
> shieldd-web@changeset

🦋  Which packages would you like to include?
◯ changed packages
  ◯ @mizufinance/transport-chrome
  ◯ @mizufinance/transport-dom
  ◯ @mizufinance/services
  ◯ minifront
```

Changeset will show you a list of packages your branch has changed. Select the
packages for which you will write notes, and you will be prompted through the
process. Commit the notes to your branch and they'll be collated together with
other change notes when you merge, and finally published by the release
workflow.
