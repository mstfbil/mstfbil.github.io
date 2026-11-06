import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

export default async function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/*.css");
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/**/*.png");
    eleventyConfig.addPassthroughCopy("src/**/*.jpg");
    eleventyConfig.addPassthroughCopy("src/**/*.jpeg")
    eleventyConfig.addPassthroughCopy("src/**/*.webp")
    eleventyConfig.addPassthroughCopy("src/.well-known");

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

    return {
        dir: {
            input: "src"
        }
    }
}
