import { Dirent } from "fs";
import { SUPPORTED_DOCUMENTS, isIncluded } from "../util/FileExclude";

isIncluded("Text/Other", { name: "F_003.woff" } as Dirent, SUPPORTED_DOCUMENTS, ["**/*.css"], ["**/*.woff"]);
