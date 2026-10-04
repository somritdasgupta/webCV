import { useEffect } from "react";
import { useSiteSettings } from "@/lib/site-settings";
import { LoadingFallback } from "./GlobalLoadingBar";

/** Old /cv links go straight to the current CV download. */
export const CvRedirect = () => {
  const { data, isFetching } = useSiteSettings();
  useEffect(() => {
    if (!isFetching && data?.resumeUrl) window.location.replace(data.resumeUrl);
  }, [data, isFetching]);
  return <LoadingFallback />;
};
