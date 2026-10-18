use std::{io, path::PathBuf};

pub fn resolve_data_dir(root: io::Result<PathBuf>, identifier: &str) -> io::Result<PathBuf> {
    let root = root?;
    if !root.is_absolute()
        || !matches!(
            identifier,
            "io.github.namdang-fdp.tally" | "io.github.namdang-fdp.tally.dev"
        )
    {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "APP_DATA_INVALID: expected absolute root and a known app identifier",
        ));
    }
    Ok(root.join(identifier))
}

#[cfg(test)]
mod tests {
    use super::resolve_data_dir;
    use std::{fs, io, path::PathBuf};

    #[test]
    fn development_writes_do_not_touch_release_data() {
        let root = tempfile::tempdir().unwrap();
        let dev =
            resolve_data_dir(Ok(root.path().into()), "io.github.namdang-fdp.tally.dev").unwrap();
        let release =
            resolve_data_dir(Ok(root.path().into()), "io.github.namdang-fdp.tally").unwrap();
        assert_ne!(dev, release);
        assert!(dev.starts_with(root.path()));
        assert!(release.starts_with(root.path()));
        fs::create_dir_all(&dev).unwrap();
        fs::write(dev.join("marker"), "development only").unwrap();
        assert!(!release.join("marker").exists());
        assert_eq!(
            fs::read_to_string(dev.join("marker")).unwrap(),
            "development only"
        );
    }

    #[test]
    fn resolution_does_not_create_directories() {
        let root = tempfile::tempdir().unwrap();
        let path = resolve_data_dir(Ok(root.path().into()), "io.github.namdang-fdp.tally").unwrap();
        assert!(!path.exists());
    }

    #[test]
    fn unavailable_root_returns_error_without_fallback() {
        let result = resolve_data_dir(
            Err(io::Error::new(
                io::ErrorKind::PermissionDenied,
                "root unavailable",
            )),
            "io.github.namdang-fdp.tally.dev",
        );
        assert_eq!(result.unwrap_err().kind(), io::ErrorKind::PermissionDenied);
    }

    #[test]
    fn relative_root_is_rejected() {
        let result = resolve_data_dir(
            Ok(PathBuf::from("relative")),
            "io.github.namdang-fdp.tally.dev",
        );
        assert_eq!(result.unwrap_err().kind(), io::ErrorKind::InvalidInput);
    }

    #[test]
    fn unknown_namespace_cannot_escape_the_data_root() {
        let root = tempfile::tempdir().unwrap();
        let result = resolve_data_dir(Ok(root.path().into()), "../release");
        assert_eq!(result.unwrap_err().kind(), io::ErrorKind::InvalidInput);
    }
}
