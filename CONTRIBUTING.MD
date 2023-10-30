# 贡献指南

感谢你的宝贵时间。你的贡献将使这个项目变得更好！在提交贡献之前，请务必花点时间阅读下面的入门指南。

## 语义化版本

该项目遵循语义化版本。我们对重要的漏洞修复发布修订号，对新特性或不重要的变更发布次版本号，对重大且不兼容的变更发布主版本号。

每个更改都应该将大致内容记录在 `docs/changelog.md` 中。

## 提交 Pull Request

1. 从 `main` 创建分支。新功能实现请发 pull request 到 `master` 分支。
2. 使用 `npm install` 安装依赖。
3. `vscode` 安装 `Prettier`、`Volar` 等插件（有自动提示，安装项目推荐的扩展）。
4. 根目录下执行 `npm prepare`。
5. 对代码库进行更改。如果适用的话，请确保进行了相应的测试。
6. 请在根目录下执行 `npm lint:fix` 进行代码格式检查。
7. 提交 git commit, 请同时遵守 [Commit 规范](#commit-指南)
8. 提交 `pull request`， 如果有对应的 `issue`，请进行关联。

## Commit 指南

Commit messages 请遵循[conventional-changelog 标准](https://www.conventionalcommits.org/en/v1.0.0/)：

```
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
```

### Commit 类型

以下是 commit 类型列表:

- feat: 新特性或功能
- fix: 缺陷修复
- docs: 文档更新
- style: 代码风格或者组件样式更新
- refactor: 代码重构，不引入新功能和缺陷修复
- perf: 性能优化
- test: 单元测试
- chore: 其他不修改 src 或测试文件的提交
- ci: 对持续集成配置文件的更改

详细信息，[参考文档](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)。

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|router|service-worker|
  │                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|
  │                          devtools
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```
