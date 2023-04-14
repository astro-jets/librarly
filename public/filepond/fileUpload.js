FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    stylePanelAspectRatio:100/100,
    imageResizeTargetWidth:100,
    imageResizeTargetHeight:50
})
FilePond.parse(document.body)
