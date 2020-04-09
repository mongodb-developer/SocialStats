// Get the Stitch App ID from the current URL
// Note that this assumes you are NOT using a custom domain
// If you are using a custom domain, you should create a 
// switch statement with a case for every environment
let url = window.location.hostname;
const STITCH_APP_ID = url.split(".")[0];

// Get the URL for the Charts dashboard based on the 
// Stitch App Id
const CHARTS_URL = getChartsUrl(STITCH_APP_ID);

function getChartsUrl(STITCH_APP_ID) {
   switch (STITCH_APP_ID) {
      case "twitter-stats-vzwpx":
         return "https://charts.mongodb.com/charts-twitter-stats-vzwpx/public/dashboards/82195382-6cea-4994-9283-cf2fb899c6de";
      case "socialstats-staging-pseyi":
         return "https://charts.mongodb.com/charts-socialstats-staging-vkoue/public/dashboards/852be5c1-3476-44b8-9d6f-74bcda18bd03";
      case "socialstats-dev-lauren-ncrqz":
         return "https://charts.mongodb.com/charts-socialstats-dev-lauren-fmxwm/public/dashboards/2e3a452e-a77d-4849-bdc0-90b361026b05";
   }
   throw new Error("Unable to find Charts URL for this app.");
}
