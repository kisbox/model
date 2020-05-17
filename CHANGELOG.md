**model /**
[Readme](https://github.com/kisbox/model/blob/master/README.md)
• [Changelog](https://github.com/kisbox/model/blob/master/CHANGELOG.md)

# Changelog

All notable changes to this project will be documented in this file.

This project adheres to **[Semantic
Versioning](https://semver.org/spec/v2.0.0.html)**. Version syntax is
`{major}.{minor}.{patch}`, where a field bump means:

- **Patch**: The release contains bug fixes.
- **Minor**: The release contains backward-compatible changes.
- **Major**: The release contains compatibility-breaking changes.

**Remember:** Both micro and minor releases are guaranteed to respect
backward-compatibility and can be updated to without risk of breakage. For major
releases, please check this changelog before upgrading.

## 1.0.0-beta.8 - 2020-05-17

### Fixed

- Logic: Fix `$define()` handling of promises.

## 1.0.0-beta.7 - 2020-05-02

### Changed

- Logic: Rewrite `$define`/`$customDefine` behavior. `$define()` now passes
  erroneous/pending states automatically. `$customDefine()` can be used to
  obtain the anterior behavior.

### Fixed

- Logic: Fix `undefined` state for `$define()` (LiveObject).

## 1.0.0-beta.6 - 2020-04-18

### Fixed

- Logic: Fix auto-update properties computation rules. In some cases,
  `$define()`d properties were computed even while one of their property where
  still `undefined`.

## 1.0.0-beta.4 - 2020-04-04

### Added

- Logic: Promise auto-resolution (\$traps).

### Changed

- Logic: '\$define' requires depends to exist. Auto-update happens once all
  dependencies are not `undefined`.
- Logic: Allow falsy object (LiveObject). `.$import()`, `.$export()`, `.$link()`
  and `.$pick()` now return silently instead of throwing an error when passed
  falsy objects such as `undefined`

## 1.0.0-beta.3 - 2020-03-28

### Fixed

- Logic: Fix event triggering order (ancestors first).

## 1.0.0-beta.2 - 2020-03-07

### Fixed

- Logic: Fix traps enumerability.
- Logic: Fix `$define` initial computation.

## 1.0.0-beta.1 - 2020-02-29

### Fixed

- Meta: Fix package.json dependencies.

## 1.0.0-beta.0 - 2020-02-09

Initial release.
