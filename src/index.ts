import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { writeFile } from 'fs/promises';
import { stringify } from 'csv-stringify/sync';

import urls from './data';
import path from 'path';

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
    let index = 0;

    const productsSliderImgs: Image[] = [];
    const productsDescriptionImgs: Image[] = [];
    const categoryImgs: Image[] = [];

    for (const url of urls) {
        const response = await fetch(url.url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            }
        });

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
                            document.querySelector<HTMLHeadingElement>('h1')
                                ?.innerText || '',
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
                            document.querySelector<HTMLHeadingElement>('h1')
                                ?.innerText || '',
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
                            document.querySelector<HTMLHeadingElement>('h1')
                                ?.innerText || '',
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

        await new Promise((resolve) => setTimeout(() => resolve(null), 10000));

        if (index > 2) break;
        index++;
    }
})();
