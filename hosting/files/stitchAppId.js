// Get the Stitch App ID from the current URL
// Note that this assumes you are NOT using a custom domain
let url = window.location.hostname;
const STITCH_APP_ID = url.split(".")[0];
