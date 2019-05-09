const fs = require('fs')
const { promisify } = require('util')
const { spawn } = require('child_process')
const path = require('path')

const fsp = {
    readdir: promisify(fs.readdir),
    lstat: promisify(fs.lstat)
}

/**
 * Upload the file
 */
function uploadFile(fileRelativePath, dstPath) {
    spawn('b2', ['upload-file', 'bucket-name', fileRelativePath, path.join('dstDir', dstPath)], {
        stdio: 'inherit',
    })
}

/**
 * Check all files and upload
 */
async function main(dPath) {
    let rootPath = path.normalize(dPath)

    if (!path.isAbsolute(rootPath)) {
        rootPath = path.join(process.cwd(), rootPath)
    }

    let fileInfo = null

    try {
        fileInfo = await fsp.lstat(rootPath)
    } catch(e) {
        console.error(e)
        return
    }

    if (fileInfo.isFile()) {
        uploadFile(rootPath, rootPath)
        return
    }

    if (!rootPath.endsWith(path.sep)) {
        rootPath = path.join(rootPath, path.sep)
    }

    console.log('Root path:', rootPath)

    async function travel(dirPath) {
        const files = await fsp.readdir(dirPath)
        for (const file of files) {
            const filePath = path.join(dirPath, file)
            const fileInfo = await fsp.lstat(filePath)
            if (fileInfo.isFile()) {
                uploadFile(filePath, filePath.slice(rootPath.length))
            } else {
                travel(filePath)
            }
        }
    }

    await travel(rootPath)

}

const dPath = '.'
main(dPath)

