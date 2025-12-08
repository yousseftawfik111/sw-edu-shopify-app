import '@shopify/ui-extensions/preact';
import {render} from "preact";
import {useAppMetafields} from "@shopify/ui-extensions/checkout/preact";

export default function() {
  render(<Extension />, document.body);
}

function Extension() {
  const cartLines = shopify.lines.value;

  const appMetafields = useAppMetafields({
    type: "product",
    namespace: "custom",
    key: "long_delivery",
  });

  const hasLongDeliveryProduct = cartLines.some((line) => {
    const productId = line.merchandise?.product?.id;
    if (!productId) return false;

    const matchingMetafield = appMetafields.find((entry) => {
      const targetId = entry.target.id;
      return productId === targetId || productId.endsWith(targetId);
    });

    return matchingMetafield?.metafield?.value === "true";
  });

  if (!hasLongDeliveryProduct) {
    return null;
  }

  return (
    <s-banner
      heading={shopify.i18n.translate("longDeliveryWarningTitle")}
      tone="critical"
    >
      <s-text>
        {shopify.i18n.translate("longDeliveryWarningDescription")}
      </s-text>
    </s-banner>
  );
}
