npm install fast-glob jsonpath-plus
npm run build


- After adding the new plugins or changing plugin JSON files, you can run:
	- npx ctdd checks

	- npx ctdd checks --json


- The /post-response endpoint and the ctdd record-post --with-checks command will merge plugin PASS/FAIL into post_check automatically.