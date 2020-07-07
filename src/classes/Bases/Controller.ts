import { ServerResponse, IncomingMessage } from "http";

export default class {
  public contructor = () => {};

  public index = (req: IncomingMessage, res: ServerResponse) => {
    res.end();
  };
}
