/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import json from '@rollup/plugin-json';
import typescriptPlugin from 'rollup-plugin-typescript2';
import typescript from 'typescript';
import { emitModulePackageFile } from '../../scripts/build/rollup_emit_module_package_file';
import pkg from './package.json';

const deps = Object.keys(
  Object.assign({}, pkg.peerDependencies, pkg.dependencies)
);

const buildPlugins = [
  typescriptPlugin({
    typescript
  }),
  json({ preferConst: true })
];

const esmBuilds = [
  {
    input: 'src/index.ts',
    output: {
      file: pkg.browser,
      format: 'es',
      sourcemap: true
    },
    external: id => deps.some(dep => id === dep || id.startsWith(`${dep}/`)),
    plugins: [...buildPlugins, emitModulePackageFile()]
  }
];

const cjsBuilds = [
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    external: id => deps.some(dep => id === dep || id.startsWith(`${dep}/`)),
    plugins: buildPlugins
  }
];

export default [...esmBuilds, ...cjsBuilds];
