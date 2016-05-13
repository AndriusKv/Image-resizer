import { expect } from "chai";
import * as ratio from "./../src/js/dev/cropper/cropper.ratio.js";

describe("Cropper ratio", () => {
    it("should set ratio", () => {
        ratio.set(1.5, 2);

        expect(ratio.get("width")).to.equal(1.5);
        expect(ratio.get("height")).to.equal(2);
    });
    
    it("should get ratio", () => {
        ratio.set(1.5, 2);

        expect(ratio.get("width")).to.equal(1.5);
        expect(ratio.get("height")).to.equal(2);
        expect(ratio.get("x")).to.equal(1.5);
        expect(ratio.get("y")).to.equal(2);
        expect(ratio.get()).to.deep.equal({
            width: 1.5,
            height: 2
        });
    });
});
