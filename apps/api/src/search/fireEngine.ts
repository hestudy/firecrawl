import axios from "axios";
import dotenv from "dotenv";
import { SearchResult } from "../../src/lib/entities";
import * as Sentry from "@sentry/node";
import { logger } from "../lib/logger";

dotenv.config();


export async function fireEngineMap(
  q: string,
  options: {
    tbs?: string;
    filter?: string;
    lang?: string;
    country?: string;
    location?: string;
    numResults: number;
    page?: number;
  }
): Promise<SearchResult[]> {
  try {
    let data = JSON.stringify({
      query: q,
      lang: options.lang,
      country: options.country,
      location: options.location,
      tbs: options.tbs,
      numResults: options.numResults,
      page: options.page ?? 1,
    });

    console.log("data", data);

    if (!process.env.FIRE_ENGINE_BETA_URL) {
      console.warn(
        "(v1/map Beta) Results might differ from cloud offering currently."
      );
      return [];
    }
    console.log("process.env.FIRE_ENGINE_BETA_URL", process.env.FIRE_ENGINE_BETA_URL);

    let config = {
      method: "POST",
      url: `${process.env.FIRE_ENGINE_BETA_URL}/search`,
      headers: {
        "Content-Type": "application/json",
        "X-Disable-Cache": "true"
      },
      data: data,
    };
    const response = await axios(config);
    if (response && response.data) {
      console.log("response", response.data);
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    return [];
  }
}
