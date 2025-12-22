import type { Case } from '../lib/util/Case';

/**
 * @internal
 */
export const NodeErrorType = {
  /** An attempt was made to access a file in a way forbidden by its file access permissions. */
  PERMISSION_DENIED: 'EACCES',

  /** An attempt to bind a server (`net`, `http`, or `https`) to a local address failed due to another server on the local system already occupying that address. */
  ADDRESS_ALREADY_IN_USE: 'EADDRINUSE',

  /** No connection could be made because the target machine actively refused it. This usually results from trying to connect to a service that is inactive on the foreign host. */
  CONNECTION_REFUSED: 'ECONNREFUSED',

  /** A connection was forcibly closed by a peer. This normally results from a loss of the connection on the remote socket due to a timeout or reboot. Commonly encountered via the http and net modules. */
  CONNECTION_RESET_BY_PEER: 'ECONNRESET',

  /** An existing file was the target of an operation that required that the target not exist. */
  FILE_EXISTS: 'EEXIST',

  /** An operation expected a file, but the given pathname was a directory. */
  IS_A_DIRECTORY: 'EISDIR',

  /** Maximum number of file descriptors allowable on the system has been reached, and requests for another descriptor cannot be fulfilled until at least one has been closed. This is encountered when opening many files at once in parallel, especially on systems (in particular, macOS) where there is a low file descriptor limit for processes. To remedy a low limit, run ulimit -n 2048 in the same shell that will run the Node.js process. */
  TOO_MANY_OPEN_FILES_IN_SYSTEM: 'EMFILE',

  /** Commonly raised by fs operations to indicate that a component of the specified pathname does not exist. No entity (file or directory) could be found by the given path. */
  NO_SUCH_FILE_OR_DIRECTORY: 'ENOENT',

  /** A component of the given pathname existed, but was not a directory as expected. Commonly raised by fs.readdir. */
  NOT_A_DIRECTORY: 'ENOTDIR',

  /** A directory with entries was the target of an operation that requires an empty directory, usually fs.unlink. */
  DIRECTORY_NOT_EMPTY: 'ENOTEMPTY',

  /** Indicates a DNS failure of either EAI_NODATA or EAI_NONAME. This is not a standard POSIX error. */
  DNS_LOOKUP_FAILED: 'ENOTFOUND',

  /** An attempt was made to perform an operation that requires elevated privileges. */
  OPERATION_NOT_PERMITTED: 'EPERM',

  /** A write on a pipe, socket, or FIFO for which there is no process to read the data. Commonly encountered at the net and http layers, indicative that the remote side of the stream being written to has been closed. */
  BROKEN_PIPE: 'EPIPE',

  /** A connect or send request failed because the connected party did not properly respond after a period of time. Usually encountered by http or net. Often a sign that a socket.end() was not properly called. */
  OPERATION_TIMED_OUT: 'ETIMEDOUT',

  /** Indicates that there is no space available on the device. */
  NO_SPACE_LEFT: 'ENOSPC',

  DEVICE_OR_RESOURCE_IS_BUSY: 'EBUSY',

  READ_ONLY: 'EROFS',

  UNKNOWN: '__UNKNOWN',
} as const;

/**
 * @internal
 */
export type NodeErrorType = Case<typeof NodeErrorType>;

/**
 * @internal
 */
export function isNodeJsErrorType(code: string): code is NodeErrorType {
  return Object.values(NodeErrorType).some((val) => val === code);
}
