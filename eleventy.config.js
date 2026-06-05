import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

export default async function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("*.css");
    eleventyConfig.addPassthroughCopy("src");

    eleventyConfig.addPlugin(eleventyNavigationPlugin);

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
            subtitle: "this blog is where i dump my thoughts, i guess",
            base: "https://voltie.is-a.dev/blog",
            author: {
                name: "voltie",
            },
        },
    });
}
