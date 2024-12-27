import "dotenv/config";

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export default function getEngineParameters(engine) {
  let params = {
    api_key: SERPAPI_API_KEY,
    engine,
  };

  switch (engine) {
    case "google":
      params.q = "Microsoft";
      params.hl = "en";
      params.gl = "us";
      params.location = "Austin, Texas, United States";
      params.device = "desktop";
      break;
    case "google_shopping":
      params.q = "Microsoft";
      params.google_domain = "google.com";
      params.hl = "en";
      params.gl = "us";
      params.device = "desktop";
      break;
    case "google_product":
      params.product_id = "4887235756540435899";
      params.google_domain = "google.com";
      params.hl = "en";
      params.gl = "us";
      break;
    case "google_trends":
      params.q = "Microsoft";
      params.hl = "en";
      params.date = "today 12-m";
      params.tz = "420";
      params.data_type = "TIMESERIES";
      break;
    case "youtube":
      params.search_query = "Microsoft";
      break;
    case "youtube_video":
      params.v = "Ag9cLvzVVTo";
      break;
    case "walmart":
      params.query = "Microsoft";
      params.device = "desktop";
      break;
    default:
      throw new Error(`Unsupported engine: ${engine}`);
  }

  return params;
}
