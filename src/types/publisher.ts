import type { PubRole } from "./pubrole";

export interface Publisher {
    id?: string,
    name: string,
    roles: PubRole['code'][]
}

