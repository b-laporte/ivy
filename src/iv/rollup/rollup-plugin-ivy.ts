import { process } from "../compiler/compiler";

export default function ivy() {
    return {
        name: 'ivy', 
        async transform(this: any, code: string, id: string): Promise<any> {
            let result: string;

            try {
                result = await process(code, id);
            } catch (e) {
                this.error(e.message || e);
                return null;
            }

            return result;
        }
    };
}
