/* eslint-disable complexity */
/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { validateVersionConfig } from './idxState';
import { IntrospectOptions, OktaAuthIdxInterface } from './types';
import { IdxRemediation, isRawIdxResponse } from './types/idx-js';
import { IDX_API_VERSION } from '../constants';
import { isAuthApiError } from '../errors';
// import { loadInvisibleFrame } from '../oidc/util/browser';
import { redirect } from '../oidc/util/browser';

export async function getDeviceChallenge (
  authClient: OktaAuthIdxInterface,
  remediation: IdxRemediation,
  options: IntrospectOptions = {}
): Promise<void> {
  let response;

  // try load from storage first
  const savedIdxResponse = authClient.transactionManager.loadIdxResponse(options);
  if (savedIdxResponse) {
    response = savedIdxResponse.rawIdxResponse;
  }

  if (!response) {
    const version = options.version || IDX_API_VERSION;
    try {
      validateVersionConfig(version);
      const url = remediation.href;
      redirect(url);
      // const iFrameId = 'deviceChallengeIFrameId';
      // response = loadInvisibleFrame(url, iFrameId);
    } catch (err) {
      if (isAuthApiError(err) && err.xhr && isRawIdxResponse(err.xhr.responseJSON)) {
        console.log(err.xhr.responseJSON);
        throw new Error('Auth Api Error');
      } else {
        throw err;
      }
    }
  }
}
