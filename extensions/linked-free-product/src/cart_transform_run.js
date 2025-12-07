// @ts-check

/**
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 * @typedef {import("../generated/api").Operation} Operation
 */

/**
 * @param {CartTransformRunInput} input
 * @returns {CartTransformRunResult}
 */
export function cartTransformRun(input) {
  /** @type {Operation[]} */
  const operations = [];

  for (const cartLine of input.cart.lines) {
    const expandOperation = buildExpandOperation(cartLine);
    if (expandOperation) {
      operations.push({ lineExpand: expandOperation });
    }
  }

  return { operations };
}

/**
 * @param {CartTransformRunInput['cart']['lines'][number]} cartLine
 * @returns {Operation['lineExpand'] | null}
 */
function buildExpandOperation(cartLine) {
  const { id: cartLineId, merchandise, cost } = cartLine;

  if (merchandise.__typename !== "ProductVariant") {
    return null;
  }

  const metafield = merchandise.product.linkedFreeProduct;
  if (!metafield?.value) {
    return null;
  }

  return {
    cartLineId,
    title: merchandise.product.title,
    expandedCartItems: [
      {
        merchandiseId: merchandise.id,
        quantity: 1,
        price: {
          adjustment: {
            fixedPricePerUnit: { amount: cost.amountPerQuantity.amount },
          },
        },
      },
      {
        merchandiseId: metafield.value,
        quantity: 1,
        price: {
          adjustment: {
            fixedPricePerUnit: { amount: "0" },
          },
        },
      },
    ],
  };
}
