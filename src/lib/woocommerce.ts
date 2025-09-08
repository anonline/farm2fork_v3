import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const Woocommerce = new WooCommerceRestApi({
  url: process.env.WOO_SITE_URL || "",
  consumerKey: process.env.WOO_USER_KEY || "",
  consumerSecret: process.env.WOO_SECRET_KEY || "",
  version: "wc/v3"
});

export default Woocommerce;
