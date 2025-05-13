mkdir -p scripts/bin

gh api -H "Accept: application/vnd.github.raw" -H "X-GitHub-Api-Version: 2022-11-28" /repos/itl-marubu/tanzakuv2/contents/docs/openapi.yml > scripts/bin/openapi.yml

npx openapi-typescript ./scripts/bin/openapi.yml -o ./src/api/generated/types.ts
