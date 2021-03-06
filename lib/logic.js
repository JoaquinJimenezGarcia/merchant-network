/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global query*/

'use strict';

const uuid = ()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,a=>(a^Math.random()*16>>a/4).toString(16));

/** 
 * Send Tokens
 * @param {org.szimano.merchantnetwork.SendTokens} tokens
 * @transaction
 */
async function send(tokens) {
    console.log(`Sending tokens ${tokens}`);

    const ownerResourceId = `resource:${tokens.from.getFullyQualifiedType()}#${tokens.from.personKey}`;
    const artWorkResourceId = `resource:org.szimano.merchantnetwork.ArtWork#${tokens.artWork.artWorkKey}`;

    const allTokens = await query('selectTokensByOwnerAndArt', 
        {
            owner: ownerResourceId,
            artWork: artWorkResourceId
        });

    if (allTokens.length < tokens.amount) {
        throw new Error("Insufficient funds on the sender")
    }

    const tokensToTransfer = allTokens.slice(0, tokens.amount).map(t => {t.owner = tokens.to; return t})

    const tokenRegistry = await getAssetRegistry('org.szimano.merchantnetwork.ArtToken');

    await tokenRegistry.updateAll(tokensToTransfer);
}

/** 
 * List ArtWork
 * @param {org.szimano.merchantnetwork.ListArtWork} artWorkListing
 * @returns {string} added artwork id
 * @transaction
 */
async function list(artWorkListing) {
    console.log(`Listing artwork ${JSON.stringify(artWorkListing)}`);

    const artWorkRegistry = await getAssetRegistry('org.szimano.merchantnetwork.ArtWork');
    const tokenRegistry = await getAssetRegistry('org.szimano.merchantnetwork.ArtToken');

    const artWork = getFactory().newResource('org.szimano.merchantnetwork', 'ArtWork', uuid());
    artWork.description = artWorkListing.artWorkDescription;
    artWork.owner = artWorkListing.owner;

    const ptx = await artWorkRegistry.add(artWork);

    const newTokens = Array(artWorkListing.tokenInitalBalance).fill(1).map((e) => {
        const t = getFactory().newResource('org.szimano.merchantnetwork', 'ArtToken', uuid());
        t.tokenName =  artWorkListing.tokenName;
        t.owner = artWorkListing.owner;
        t.artWork = artWork;
        t.onSale = false;
        return t;
    });

    const tx = await tokenRegistry.addAll(newTokens);

    return artWork.artWorkKey;
}

/** 
 * Sell ArtWork
 * @param {org.szimano.merchantnetwork.SellArtWork} sellArt
 * @transaction
 */
async function sell(sellArt) {
    const tokensForArt = await query('selectTokensByArt', 
        {
            artWork: `resource:org.szimano.merchantnetwork.ArtWork#${sellArt.artWork.artWorkKey}`
        });

    const sellingTokens = tokensForArt.filter((t) => t.onSale);

    if (sellingTokens.length * 2 < tokensForArt.length) {
        throw new Error("There is no quorum (50%) for selling the art.")
    }
}