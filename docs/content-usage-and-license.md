# Content Usage And License Notes

This is an engineering note, not legal advice.

## Current Sources

| Dataset | Source | Local source | License status |
| --- | --- | --- | --- |
| JavaScript interview | `sudheerj/javascript-interview-questions` | `external/sudheerj-javascript-interview-questions` | No explicit license file found in the cloned repository. GitHub license API returned `404`. |
| Data structures and algorithms | `sudheerj/datastructures-algorithms` | `external/sudheerj-datastructures-algorithms` | MIT license text found at `external/sudheerj-datastructures-algorithms/src/LICENSE.md`. GitHub root license API returned `404` because the license is not at repository root. |

## What This Means

For personal local preparation:

- The current database is fine to use locally for learning and interview practice.
- Keeping the original `external/` repositories is useful for provenance and future re-imports.

For a public or commercial production app, including App Store distribution:

- The DSA dataset is relatively safe to use only if the MIT license notice is preserved in the app/package.
- The JavaScript interview dataset is not safe to assume as production-usable because there is no explicit license grant in the cloned repo.
- The Russian translations are derivative content. If the original content has no license grant, translating it does not remove that restriction.

## Recommended Production Paths

Best option for App Store/commercial release:

- Get explicit written permission from the author for `sudheerj/javascript-interview-questions`, or wait until the repository has a clear license.
- Preserve attribution and license notices in an in-app `Licenses` or `Acknowledgements` screen.
- Keep source metadata in every card/task.

Safer alternative:

- Use the imported database only as internal study/source material.
- Create a new original curated deck from scratch, inspired by topics but not copying text, answers, explanations, or translations.
- Keep DSA MIT material only if the MIT notice is shipped with the app.

## Deletion Policy

Do not delete `external/` yet.

Reasons:

- It preserves the exact imported source revisions.
- It lets import scripts be rerun.
- It gives provenance for audit and attribution.
- It is important while JS licensing is unresolved.

The generated app can load only `data/cards`, `data/dsa`, and `data/coding-exercise`, but the repository should keep `external/` until content licensing is finalized.
