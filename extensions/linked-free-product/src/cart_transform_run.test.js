import { describe, it, expect } from "vitest";
import { cartTransformRun } from "./cart_transform_run";

describe("cartTransformRun", () => {
  it("returns empty operations when no linked free product", () => {
    const input = {
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/1",
            quantity: 1,
            cost: { amountPerQuantity: { amount: "29.99" } },
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/111",
              product: {
                title: "Regular T-Shirt",
                linkedFreeProduct: null,
              },
            },
          },
        ],
      },
    };

    expect(cartTransformRun(input)).toEqual({ operations: [] });
  });

  it("expands cart line with free product", () => {
    const input = {
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/1",
            quantity: 2,
            cost: { amountPerQuantity: { amount: "49.99" } },
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/111",
              product: {
                title: "Premium Headphones",
                linkedFreeProduct: {
                  value: "gid://shopify/ProductVariant/222",
                },
              },
            },
          },
        ],
      },
    };

    const result = cartTransformRun(input);

    expect(result.operations).toHaveLength(1);

    const expandOperation = result.operations[0].lineExpand;
    expect(expandOperation.cartLineId).toBe("gid://shopify/CartLine/1");
    expect(expandOperation.title).toBe("Premium Headphones");
    expect(expandOperation.expandedCartItems).toHaveLength(2);

    expect(expandOperation.expandedCartItems[0]).toEqual({
      merchandiseId: "gid://shopify/ProductVariant/111",
      quantity: 1,
      price: { adjustment: { fixedPricePerUnit: { amount: "49.99" } } },
    });

    expect(expandOperation.expandedCartItems[1]).toEqual({
      merchandiseId: "gid://shopify/ProductVariant/222",
      quantity: 1,
      price: { adjustment: { fixedPricePerUnit: { amount: "0" } } },
    });
  });

  it("skips CustomProduct merchandise", () => {
    const input = {
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/1",
            quantity: 1,
            cost: { amountPerQuantity: { amount: "50.00" } },
            merchandise: {
              __typename: "CustomProduct",
            },
          },
        ],
      },
    };

    expect(cartTransformRun(input)).toEqual({ operations: [] });
  });

  it("handles mixed cart lines", () => {
    const input = {
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/1",
            quantity: 1,
            cost: { amountPerQuantity: { amount: "99.99" } },
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/111",
              product: {
                title: "Smart Watch",
                linkedFreeProduct: {
                  value: "gid://shopify/ProductVariant/888",
                },
              },
            },
          },
          {
            id: "gid://shopify/CartLine/2",
            quantity: 2,
            cost: { amountPerQuantity: { amount: "19.99" } },
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/333",
              product: {
                title: "Phone Case",
                linkedFreeProduct: null,
              },
            },
          },
        ],
      },
    };

    const result = cartTransformRun(input);
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].lineExpand.cartLineId).toBe("gid://shopify/CartLine/1");
  });
});
