import { expect } from "chai";
import * as images from "./../src/js/dev/dropbox/dropbox.images.js";

describe("Dropbox images", () => {
    afterEach(() => {
        images.reset();
    });

    it("should get array", () => {
        expect(images.getAll()).to.be.a("array");
    });

    it("should add value to array", () => {
        images.add(4);
        images.add(5);
        images.add(6);

        expect(images.getAll().length).to.equal(3);
    });

    it("should reset array", () => {
        images.add(4);
        images.add(5);
        images.add(6);
        images.reset();

        expect(images.getAll().length).to.equal(0);
    });
});
