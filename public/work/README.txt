Project images go here, one folder per project slug.

    public/work/nike-swdc/cover.jpg
    public/work/nike-swdc/01.jpg
    public/work/nike-swdc/02.jpg

Then reference them in lib/projects.ts:

    cover: "/work/nike-swdc/cover.jpg"
    gallery: [{ src: "/work/nike-swdc/01.jpg", ... }]

Slugs (from lib/projects.ts):

    nike-swdc            dime-luxury-bags     daniel-arsham
    nike-pensole         dime-hof-2024        kyta
    dime-gummies         greenmart            y3-retail-display
    dicesaic             dime-bike-decal      logofolio
    multimedia-art

Until a file is referenced, the project renders generated artwork. That is the
intended fallback, not an error state.
