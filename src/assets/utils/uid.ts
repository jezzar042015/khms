import ShortUniqueId from 'short-unique-id';

export default {
    generate() {
        const uid = new ShortUniqueId({ length: 8});
        return uid.rnd()
    }
}
