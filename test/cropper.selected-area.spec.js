import { expect } from "chai";
import * as area from "./../src/js/dev/cropper/cropper.selected-area.js";

describe("Cropper selected area", () => {
    afterEach(() => {
        area.reset();
    });

    it("should get transformed area", () => {
        const selectedArea = {
            x: 100,
            y: 200,
            width: 300,
            height: 400
        };

        area.setTransformed(selectedArea);

        expect(area.getTransformed()).to.deep.equal(selectedArea);
    });

    it("should get area property", () => {
        area.setProp("x", 100);
        area.setProp("y", 200);
        area.setProp("width", 300);
        area.setProp("height", 400);

        expect(area.getProp("x")).to.equal(100);
        expect(area.getProp("y")).to.equal(200);
        expect(area.getProp("width")).to.equal(300);
        expect(area.getProp("height")).to.equal(400);
    });

    it("should set area property", () => {
        area.setProp("x", 100);
        area.setProp("y", 200);
        area.setProp("width", 300);
        area.setProp("height", 400);

        expect(area.getProp("x")).to.equal(100);
        expect(area.getProp("y")).to.equal(200);
        expect(area.getProp("width")).to.equal(300);
        expect(area.getProp("height")).to.equal(400);
    });

    it("should set default area position", () => {
        area.setDefaultPos(150, 250);

        expect(area.getProp("x")).to.equal(150);
        expect(area.getProp("y")).to.equal(250);
    });

    it("should reset area", () => {
        area.setProp("x", 100);
        area.setProp("y", 200);
        area.setProp("width", 300);
        area.setProp("height", 400);
        area.reset();

        expect(area.get()).to.deep.equal({
            x: 0,
            y: 0,
            width: 0,
            height: 0
        });
    });

    it("should reset transformed area", () => {
        const selectedArea = {
            x: 100,
            y: 200,
            width: 300,
            height: 400
        };

        area.setTransformed(selectedArea);
        area.reset();

        expect(area.getTransformed()).to.deep.equal({
            x: 0,
            y: 0,
            width: 0,
            height: 0
        });
    });

    it("should check if mouse is inside area", () => {
        const selectedArea = {
            x: 100,
            y: 200,
            width: 300,
            height: 400
        };

        expect(area.isInside(selectedArea, 150, 490)).to.be.true;
        expect(area.isInside(selectedArea, 150, 180)).to.be.false;
        expect(area.isInside(selectedArea, 450, 180)).to.be.false;
        expect(area.isInside(selectedArea, 450, 250)).to.be.false;
        expect(area.isInside(selectedArea, 450, 650)).to.be.false;
        expect(area.isInside(selectedArea, 150, 650)).to.be.false;
        expect(area.isInside(selectedArea, 80, 650)).to.be.false;
        expect(area.isInside(selectedArea, 80, 250)).to.be.false;
        expect(area.isInside(selectedArea, 80, 180)).to.be.false;
    });

    it("should check if mouse is inside rotated area", () => {
        const selectedArea = {
            x: 100,
            y: 200,
            width: 300,
            height: 400
        };

        expect(area.isInside(selectedArea, 150, 490), true).to.be.true;
        expect(area.isInside(selectedArea, 150, 180), true).to.be.false;
        expect(area.isInside(selectedArea, 450, 180), true).to.be.false;
        expect(area.isInside(selectedArea, 450, 250), true).to.be.false;
        expect(area.isInside(selectedArea, 450, 650), true).to.be.false;
        expect(area.isInside(selectedArea, 150, 650), true).to.be.false;
        expect(area.isInside(selectedArea, 80, 650), true).to.be.false;
        expect(area.isInside(selectedArea, 80, 250), true).to.be.false;
        expect(area.isInside(selectedArea, 80, 180), true).to.be.false;
    });

    describe("area.update", () => {
        const transform = {
            a: 2, // scale
            e: 100, // translated x
            f: 200 // translated y
        };

        beforeEach(() => {
            area.setProp("x", 100);
            area.setProp("y", 200);
            area.setProp("width", -300);
            area.setProp("height", -400);
        });

        it("should update area.x and area.width if negative", () => {
            area.update("x", 250, transform);

            const transformedArea = area.getTransformed();
            const expectedValue = transform.e + transformedArea.x * transform.a;

            expect(area.getProp("x")).to.equal(expectedValue);
            expect(transformedArea.x).to.equal(250);
            expect(area.getProp("width")).to.equal(300);
        });

        it("should update area.y and area.height if negative", () => {
            area.update("y", 250, transform);

            const transformedArea = area.getTransformed();
            const expectedValue = transform.f + transformedArea.y * transform.a;

            expect(area.getProp("y")).to.equal(expectedValue);
            expect(transformedArea.y).to.equal(250);
            expect(area.getProp("height")).to.equal(400);
        });

        it("should update area.width and area.x if area.width is negative", () => {
            const width = area.getProp("width");
            const x = area.getProp("x");

            area.update("width", 250, transform);

            const transformedArea = area.getTransformed();
            const expectedValue = transformedArea.width * transform.a;

            expect(area.getProp("width")).to.equal(expectedValue);
            expect(transformedArea.width).to.equal(250);
            expect(area.getProp("x")).to.equal(x + width);
        });

        it("should update area.height and area.y if area.height is negative", () => {
            const height = area.getProp("height");
            const y = area.getProp("y");

            area.update("height", 250, transform);

            const transformedArea = area.getTransformed();
            const expectedValue = transformedArea.height * transform.a;

            expect(area.getProp("height")).to.equal(expectedValue);
            expect(transformedArea.height).to.equal(250);
            expect(area.getProp("y")).to.equal(y + height);
        });
    });
});