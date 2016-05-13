import { expect } from "chai";
import * as quality from "./../src/js/dev/cropper/cropper.quality.js";

describe("Cropper quality", () => {
    it("should get quality", () => {
        quality.set(0.5);

        expect(quality.get()).to.equal(0.5);
    });

    it("should get default quality", () => {
        quality.set(0.5);
        quality.reset();

        expect(quality.get()).to.equal(0.92);
    });

    describe("quality.useImageWithQuality", () => {
        it("should be true", () => {
            quality.set(0.5);

            expect(quality.useImageWithQuality()).to.be.true;
        });

        it("should be false", () => {
            quality.set(0.92);

            expect(quality.useImageWithQuality()).to.be.false;
        });
    });
});
