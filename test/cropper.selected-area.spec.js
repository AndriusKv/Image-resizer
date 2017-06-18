import * as area from "./../src/js/cropper/cropper.selected-area.js";

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

        expect(area.getTransformed()).toEqual(selectedArea);
    });

    it("should get area property", () => {
        area.setProp("x", 100);
        area.setProp("y", 200);
        area.setProp("width", 300);
        area.setProp("height", 400);

        expect(area.getProp("x")).toBe(100);
        expect(area.getProp("y")).toBe(200);
        expect(area.getProp("width")).toBe(300);
        expect(area.getProp("height")).toBe(400);
    });

    it("should set area property", () => {
        area.setProp("x", 100);
        area.setProp("y", 200);
        area.setProp("width", 300);
        area.setProp("height", 400);

        expect(area.getProp("x")).toBe(100);
        expect(area.getProp("y")).toBe(200);
        expect(area.getProp("width")).toBe(300);
        expect(area.getProp("height")).toBe(400);
    });

    it("should set default area position", () => {
        area.setDefaultPos(150, 250);

        expect(area.getProp("x")).toBe(150);
        expect(area.getProp("y")).toBe(250);
    });

    it("should reset area", () => {
        area.setProp("x", 100);
        area.setProp("y", 200);
        area.setProp("width", 300);
        area.setProp("height", 400);
        area.reset();

        expect(area.get()).toEqual({
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

        expect(area.getTransformed()).toEqual({
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

        expect(area.isInside(selectedArea, 150, 490)).toBeTruthy();
        expect(area.isInside(selectedArea, 150, 180)).toBeFalsy();
        expect(area.isInside(selectedArea, 450, 180)).toBeFalsy();
        expect(area.isInside(selectedArea, 450, 250)).toBeFalsy();
        expect(area.isInside(selectedArea, 450, 650)).toBeFalsy();
        expect(area.isInside(selectedArea, 150, 650)).toBeFalsy();
        expect(area.isInside(selectedArea, 80, 650)).toBeFalsy();
        expect(area.isInside(selectedArea, 80, 250)).toBeFalsy();
        expect(area.isInside(selectedArea, 80, 180)).toBeFalsy();
    });

    it("should check if mouse is inside rotated area", () => {
        const selectedArea = {
            x: 100,
            y: 200,
            width: 300,
            height: 400
        };

        expect(area.isInside(selectedArea, 150, 490, 1)).toBeTruthy();
        expect(area.isInside(selectedArea, 150, 180, 1)).toBeFalsy();
        expect(area.isInside(selectedArea, 450, 180, 1)).toBeFalsy();
        expect(area.isInside(selectedArea, 450, 250, 1)).toBeFalsy();
        expect(area.isInside(selectedArea, 450, 650, 1)).toBeFalsy();
        expect(area.isInside(selectedArea, 150, 650, 1)).toBeFalsy();
        expect(area.isInside(selectedArea, 80, 650, 1)).toBeFalsy();
        expect(area.isInside(selectedArea, 80, 250, 1)).toBeFalsy();
        expect(area.isInside(selectedArea, 80, 180, 1)).toBeFalsy();
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

            expect(area.getProp("x")).toBe(expectedValue);
            expect(transformedArea.x).toBe(250);
            expect(area.getProp("width")).toBe(300);
        });

        it("should update area.y and area.height if negative", () => {
            area.update("y", 250, transform);

            const transformedArea = area.getTransformed();
            const expectedValue = transform.f + transformedArea.y * transform.a;

            expect(area.getProp("y")).toBe(expectedValue);
            expect(transformedArea.y).toBe(250);
            expect(area.getProp("height")).toBe(400);
        });

        it("should update area.width and area.x if area.width is negative", () => {
            const width = area.getProp("width");
            const x = area.getProp("x");

            area.update("width", 250, transform);

            const transformedArea = area.getTransformed();
            const expectedValue = transformedArea.width * transform.a;

            expect(area.getProp("width")).toBe(expectedValue);
            expect(transformedArea.width).toBe(250);
            expect(area.getProp("x")).toBe(x + width);
        });

        it("should update area.height and area.y if area.height is negative", () => {
            const height = area.getProp("height");
            const y = area.getProp("y");

            area.update("height", 250, transform);

            const transformedArea = area.getTransformed();
            const expectedValue = transformedArea.height * transform.a;

            expect(area.getProp("height")).toBe(expectedValue);
            expect(transformedArea.height).toBe(250);
            expect(area.getProp("y")).toBe(y + height);
        });
    });

    it("should get area draw state", () => {
        expect(area.containsArea(true)).toBeTruthy();
    });

    it("should check if area is drawn", () => {
        area.containsArea(false);
        expect(area.isDrawn()).toBeFalsy();
    });
});
