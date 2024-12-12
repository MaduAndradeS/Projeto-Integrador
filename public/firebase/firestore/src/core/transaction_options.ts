/**
 * @license
 * Copyright 2022 Google LLC
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

import { Code, FirestoreError } from '../util/error';

export const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
  maxAttempts: 5
};

/**
 * Options to customize transaction behavior.
 */
export declare interface TransactionOptions {
  /** Maximum number of attempts to commit, after which transaction fails. Default is 5. */
  readonly maxAttempts: number;
}

export function validateTransactionOptions(options: TransactionOptions): void {
  if (options.maxAttempts < 1) {
    throw new FirestoreError(
      Code.INVALID_ARGUMENT,
      'Max attempts must be at least 1'
    );
  }
}
