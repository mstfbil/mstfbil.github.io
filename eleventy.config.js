import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

export default async function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("*.css");
    eleventyConfig.addPassthroughCopy("src");
    eleventyConfig.addPassthroughCopy(".well-known");
    eleventyConfig.addPassthroughCopy("404.html")

    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addPlugin(feedPlugin, {
        type: "atom",
        outputPath: "/feed.xml",
        collection: {
            name: "posts",
            limit: 10,
        },
        metadata: {
            language: "en",
            title: "voltie_dev's blog",
            subtitle: "a blog about development, and stuff",
            base: "https://voltie.is-a.dev/blog",
            author: {
                name: "voltie",
            },
        },
    });
}
