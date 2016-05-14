import { expect } from "chai";
import * as images from "./../src/js/dev/dropbox/dropbox.images.js";

describe("Dropbox images", () => {
    afterEach(() => {
        images.reset();
    });

    it("should get array", () => {
        expect(images.getAll()).to.be.a("array");
    });

    it("should get array length", () => {
        expect(images.getCount()).to.be.a("number");
    });

    it("should get first array element", () => {
        images.add(4);

        expect(images.getFirst()).to.equal(4);
    });

    it("should add value to array", () => {
        images.add(4);
        images.add(5);
        images.add(6);

        expect(images.getCount()).to.equal(3);
    });

    it("should remove array element at index", () => {
        images.add(4);
        images.add(5);
        images.add(6);
        images.remove(1);

        expect(images.getAll()).to.deep.equal([4, 6]);
    });

    it("should reset array element", () => {
        images.reset();

        expect(images.getCount()).to.equal(0);
    });

    it("should get stored image count", () => {
        expect(images.getStoredImageCount()).to.be.a("number");
    });

    it("should increment stored image count", () => {
        images.incStoredImageCount();
        images.incStoredImageCount();

        expect(images.getStoredImageCount()).to.equal(2);
    });

    it("should reset astored image count", () => {
        images.incStoredImageCount();
        images.incStoredImageCount();
        images.incStoredImageCount();
        images.resetStoredImageCount();

        expect(images.getStoredImageCount()).to.equal(0);
    });
});
