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
function uploadFile(bucketName, fileRelativePath, dstPath) {
    console.log('Task: buckName:', bucketName, 'srcPath:', fileRelativePath, 'dstPath:', dstPath)
    spawn('b2', ['upload-file', bucketName, fileRelativePath, dstPath], {
        stdio: 'inherit',
    })
}

/**
 * Check all files and upload
 */
async function main(bucketName, srcPath, dstPath) {
    let rootPath = path.normalize(srcPath)

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
                uploadFile(bucketName, filePath, path.join(dstPath, filePath.slice(rootPath.length)))
            } else {
                travel(filePath)
            }
        }
    }

    await travel(rootPath)

}


/**
 * arg1: bucketName
 * arg2: srcPath
 * arg3: dstPath
 */
const argvLen = process.argv.length
if (argvLen < 4) {
    console.log(`
    How to use:
        b2-upload-dir bucketName srcPath dstPath\n`)
} else {
    const bucketName = process.argv[argvLen - 3]
    const srcPath = process.argv[argvLen - 2]
    const dstPath = process.argv[argvLen - 1]
    console.log('path:', bucketName, srcPath, dstPath)
    main(bucketName, srcPath, dstPath)
}
