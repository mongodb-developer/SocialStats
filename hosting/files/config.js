// Get the Realm App ID from the current URL
// Note that this assumes you are NOT using a custom domain
// If you are using a custom domain, you should create a 
// switch statement with a case for every environment
let url = window.location.hostname;
const REALM_APP_ID = url.split(".")[0];

// Get the URL for the Charts dashboard based on the 
// Realm App Id
const CHARTS_URL = getChartsUrl(REALM_APP_ID);

function getChartsUrl(REALM_APP_ID) {
   switch (REALM_APP_ID) {
      case "drgh-hfxea":
         return "https://charts.mongodb.com/charts-sheeri-jymux/dashboards/b026482b-fc74-4386-96f2-e2b781a17235";
      case "socialstats-staging-pseyi":
         return "https://charts.mongodb.com/charts-socialstats-staging-vkoue/public/dashboards/852be5c1-3476-44b8-9d6f-74bcda18bd03";
      case "socialstats-dev-lauren-ncrqz":
         return "https://charts.mongodb.com/charts-socialstats-dev-lauren-fmxwm/public/dashboards/2e3a452e-a77d-4849-bdc0-90b361026b05";
   }
   throw new Error("Unable to find Charts URL for this app.");
}
