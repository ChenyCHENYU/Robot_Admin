# Spreadsheet test fixtures

These small XLSX files preserve the payloads previously generated inside the three browser tests. Tests read them as bytes; Robot_Admin does not install or import a separate `xlsx` package. Download verification uses the public `@robot-admin/file-utils/excel` `useExcel().readFile()` API.

Generated once on 2026-10-24 with the unmodified official SheetJS Community Edition 0.20.3 runtime (`utils.aoa_to_sheet` / `utils.json_to_sheet`, `utils.book_append_sheet`, `write` with `type: "buffer"`, `bookType: "xlsx"`, `compression: true`). No SheetJS runtime, source archive or business data is copied into this directory. The source archive integrity is:

```text
sha512-oLDq3jw7AcLqKWH2AhCpVTZl8mf6X2YReP+Neh0SJUzV/BdZYjth94tG5toiMB1PPrYtxOCfaoUCkvtuH+3AJA==
```

## Payloads

| File                      | Worksheet  | Header and rows                                                                           |
| ------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `settlement-review.xlsx`  | `结算明细` | `业务编号, 证件编号, 结算金额, 完成率`; `"000042", "12345678901234567890", 1234.5, 0.125` |
| `settlement-review.xlsx`  | `复核记录` | `工作项, 数量`; `"跨表核对", 7`                                                           |
| `loading-check.xlsx`      | `员工`     | `姓名, 部门`; `"张三", "技术部"`                                                          |
| `table-verification.xlsx` | `员工`     | `姓名, 部门, 薪资`; `"张三", "技术部", 8000`; `"李四", "设计部", 9000`                    |

The two identifiers in `结算明细` are **text cells from the source file**, preserving the leading zeros and the 20-digit value. Cell `C2` uses number format `#,##0.00` and displays `1,234.50`; `D2` uses `0.0%` and displays `12.5%`. Sheet order is `结算明细` then `复核记录`.

## Integrity

| File                      | Bytes | SHA256                                                             |
| ------------------------- | ----: | ------------------------------------------------------------------ |
| `settlement-review.xlsx`  |  9471 | `cd21e868ca11f62ee60ab89ecdb93cece3fcc66b94aec07e3a3c281c8f0a69c1` |
| `loading-check.xlsx`      |  8624 | `9a4ffa4e1e7bf149b34215ac9f4c20fdcd5cee0975efa4dbcd88d754df727dec` |
| `table-verification.xlsx` |  8716 | `46cb955f409bd70aac3330327ff4e41c2e12e4033ba3dfee3223d15855ccd560` |

When changing a fixture, keep its corresponding business assertions and this payload/integrity table in sync. Regeneration is a maintenance operation with the verified upstream build tool; running the tests requires only the committed binary files and the app's declared public dependencies.
