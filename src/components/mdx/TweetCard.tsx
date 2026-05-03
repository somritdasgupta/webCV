import { Tweet } from "react-tweet";

/**
 * Wrap react-tweet in a `.not-prose` container so the article's prose styles
 * (link underlines, accent color, image rounding, paragraph spacing) don't
 * bleed into the embed. We also reset the link decoration explicitly because
 * `prose a { text-decoration }` has higher specificity than the library
 * defaults in some cases.
 */
export const TweetCard = ({ id }: { id: string }) => (
  <div className="not-prose my-8 flex justify-center [&_a]:no-underline [&_a]:!text-inherit [&_img]:!my-0 [&_img]:!rounded-none [&_p]:!my-0">
    <Tweet id={id} />
  </div>
);
