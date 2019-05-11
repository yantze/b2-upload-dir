# b2-upload-dir
Upload files in bulk with `b2 upload-file`, which can be used to write only.

## INSTALL
Must install [`b2`](https://www.backblaze.com/b2/docs/quick_command_line.html<Paste>) first.
```
npm install -g b2-upload-dir
```

## USAGE

```
b2-upload-dir bucketName path/to/upload b2DirName/path
```

Example:
```
b2-upload-dir y-work-bucket ./test root-path/test
```


## LISENCE
MIT
