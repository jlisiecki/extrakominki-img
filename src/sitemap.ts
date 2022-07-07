import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

(async () => {
    const response = await fetch(
        'https://extrakominki.pl/console/integration/execute/name/GoogleSitemap'
    );
    const text = await response.text();

    const { document } = new JSDOM(text).window;

    const sitemaps = Array.from(document.querySelectorAll('loc')).map((loc) =>
        loc.textContent?.trim()
    );

    type Type = 'produkt' | 'kategoria';

    const urls: { url: string; type: Type }[] = [];

    for (const sitemap of sitemaps.filter(
        (sitemap) =>
            sitemap !== undefined && sitemap.match(/(products|categories)/)
    ) as string[]) {
        const type: Type = sitemap.match(/products/) ? 'produkt' : 'kategoria';

        const response = await fetch(sitemap);
        const text = await response.text();

        const { document } = new JSDOM(text).window;

        const locs = Array.from(document.querySelectorAll('loc')).map((loc) =>
            loc.textContent?.trim()
        );

        urls.push(
            ...(locs.filter((loc) => loc !== undefined) as string[]).map(
                (loc) => ({ url: loc, type })
            )
        );
    }
    console.log(JSON.stringify(urls, null, 4));
})();
