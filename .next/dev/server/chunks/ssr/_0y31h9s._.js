module.exports = [
"[project]/src/lib/auth/session.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/src/lib/auth/session.ts [app-rsc] (ecmascript)");
    });
});
}),
"[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_next_dist_1028-n-._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript)");
    });
});
}),
];