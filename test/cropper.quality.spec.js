import * as quality from "./../src/js/cropper/cropper.quality.js";

describe("Cropper quality", () => {
    it("should get quality", () => {
        quality.set(0.5);

        expect(quality.get()).toBeCloseTo(0.5);
    });

    it("should get default quality", () => {
        quality.set(0.5);
        quality.reset();

        expect(quality.get()).toBeCloseTo(0.92);
    });

    describe("quality.useImageWithQuality", () => {
        it("should be true", () => {
            quality.set(0.5);

            expect(quality.useImageWithQuality()).toBeTruthy();
        });

        it("should be false", () => {
            quality.set(0.92);

            expect(quality.useImageWithQuality()).toBeFalsy();
        });
    });
});
