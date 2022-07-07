import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { existsSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { AbortController } from 'node-abort-controller';

import urls from './data';

interface Image {
    pageUrl: string;
    imageUrl: string;
    pageTite: string;
    pageH1: string;
    imageAlt: string;
    imageTitle: string;
    dataImageDescription: string;
    dataImgName: string;
}

(async () => {
    const productsSliderImgs: Image[] = existsSync(
        path.resolve(__dirname, '../productsSliderImgs.csv')
    )
        ? parse(
              await readFile(
                  path.resolve(__dirname, '../productsSliderImgs.csv'),
                  'utf-8'
              ),
              { columns: true }
          )
        : [];
    const productsDescriptionImgs: Image[] = existsSync(
        path.resolve(__dirname, '../productsDescriptionImgs.csv')
    )
        ? parse(
              await readFile(
                  path.resolve(__dirname, '../productsDescriptionImgs.csv'),
                  'utf-8'
              ),
              { columns: true }
          )
        : [];
    const categoryImgs: Image[] = existsSync(
        path.resolve(__dirname, '../categoryImgs.csv')
    )
        ? parse(
              await readFile(
                  path.resolve(__dirname, '../categoryImgs.csv'),
                  'utf-8'
              ),
              { columns: true }
          )
        : [];

    for (const url of urls.filter((url) => {
        if (productsSliderImgs.find((image) => image.pageUrl === url.url))
            return false;
        if (productsDescriptionImgs.find((image) => image.pageUrl === url.url))
            return false;
        if (categoryImgs.find((image) => image.pageUrl === url.url))
            return false;
        return true;
    })) {
        const controller = new AbortController();
        const { signal } = controller;

        const response = await fetch(url.url, {
            signal,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            }
        });

        setTimeout(() => controller.abort(), 5000);

        if (!response.ok) throw new Error('Błąd: ' + response.status);

        const text = await response.text();

        const { document } = new JSDOM(text).window;

        if (url.type === 'produkt') {
            document
                .querySelectorAll<HTMLImageElement>('.productimg img')
                .forEach((img) => {
                    const image: Image = {
                        pageUrl: url.url,
                        imageUrl: img.src,
                        pageTite: document.title,
                        pageH1:
                            document
                                .querySelector<HTMLHeadingElement>('h1')
                                ?.textContent?.trim() || '',
                        imageAlt: img.alt,
                        imageTitle: img.title,
                        dataImageDescription:
                            img.getAttribute('data-image-description') || '',
                        dataImgName:
                            img.getAttribute('data-image-description') || ''
                    };
                    productsSliderImgs.push(image);
                });

            document
                .querySelectorAll<HTMLImageElement>('#box_description img')
                .forEach((img) => {
                    const image: Image = {
                        pageUrl: url.url,
                        imageUrl: img.src,
                        pageTite: document.title,
                        pageH1:
                            document
                                .querySelector<HTMLHeadingElement>('h1')
                                ?.textContent?.trim() || '',
                        imageAlt: img.alt,
                        imageTitle: img.title,
                        dataImageDescription:
                            img.getAttribute('data-image-description') || '',
                        dataImgName:
                            img.getAttribute('data-image-description') || ''
                    };
                    productsDescriptionImgs.push(image);
                });
            const productsSliderImgsCSV = stringify(productsSliderImgs, {
                header: true
            });
            await writeFile(
                path.resolve(__dirname, '../productsSliderImgs.csv'),
                productsSliderImgsCSV
            );

            const productsDescriptionImgsCSV = stringify(
                productsDescriptionImgs,
                { header: true }
            );
            await writeFile(
                path.resolve(__dirname, '../productsDescriptionImgs.csv'),
                productsDescriptionImgsCSV
            );
        } else {
            document
                .querySelectorAll<HTMLImageElement>('#box_mainproducts img')
                .forEach((img) => {
                    const image: Image = {
                        pageUrl: url.url,
                        imageUrl: img.dataset.src || img.src,
                        pageTite: document.title,
                        pageH1:
                            document
                                .querySelector<HTMLHeadingElement>('h1')
                                ?.textContent?.trim() || '',
                        imageAlt: img.alt,
                        imageTitle: img.title,
                        dataImageDescription:
                            img.getAttribute('data-image-description') || '',
                        dataImgName:
                            img.getAttribute('data-image-description') || ''
                    };
                    categoryImgs.push(image);
                });

            const categoryImgsCSV = stringify(categoryImgs, { header: true });
            await writeFile(
                path.resolve(__dirname, '../categoryImgs.csv'),
                categoryImgsCSV
            );
        }
        await new Promise((resolve) => setTimeout(() => resolve(null), 0));
        console.log(response.status + ' Przeanalizowano: ' + url.url);
    }
})();
