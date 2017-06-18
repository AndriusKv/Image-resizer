import * as images from "./../src/js/dropbox/dropbox.images.js";

describe("Dropbox images", () => {
    afterEach(() => {
        images.reset();
    });

    it("should get array", () => {
        expect(images.getAll()).toEqual([]);
    });

    it("should add value to array", () => {
        images.add(4);
        images.add(5);
        images.add(6);

        expect(images.getAll()).toHaveLength(3);
    });

    it("should reset array", () => {
        images.add(4);
        images.add(5);
        images.add(6);
        images.reset();

        expect(images.getAll()).toHaveLength(0);
    });
});
