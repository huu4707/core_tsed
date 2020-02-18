import {
    ConverterService,
    EndpointInfo,
    GlobalAcceptMimesMiddleware,
    IMiddleware,
    OverrideProvider,
    Res,
    ResponseData,
    SendResponseMiddleware,
    ServerLoader,
    ServerSettings
  } from "@tsed/common";
  import {isBoolean, isNumber, isStream, isString} from "@tsed/core";
  import "@tsed/passport";
  import "@tsed/swagger";
  import "@tsed/typeorm";
  import * as bodyParser from "body-parser";
  import * as compress from "compression";
  import * as cookieParser from "cookie-parser";
  import * as cors from "cors";
  import * as session from "express-session";
  import * as methodOverride from "method-override";
  import {User} from "./entities/User";
  
  const rootDir = __dirname;
  
  @ServerSettings({
    rootDir,
    httpPort: process.env.PORT || 8083,
    httpsPort: false,
    acceptMimes: ["application/json"],
    mount: {
      "/v1": [
        `${rootDir}/controllers/**/**Ctrl.{ts,js}`
      ]
    },
    componentsScan: [
      `${rootDir}/services/*{.ts,.js}`,
      `${rootDir}/repositories/*{.ts,.js}`,
      `${rootDir}/protocols/*{.ts,.js}`
    ],
    passport: {
      userInfoModel: User
    },
    typeorm: [
      {
        name: "default",
        type: "mysql",
        host: process.env.POSTGRES_HOST || "localhost",
        port: 8889,
        username: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DB || "core_tsed",
        logging: false,
        synchronize: true,
        entities: [
          `${rootDir}/entities/*{.ts,.js}`
        ],
        migrations: [
          `${rootDir}/migrations/*{.ts,.js}`
        ],
        subscribers: [
          `${rootDir}/subscriber/*{.ts,.js}`
        ]
      }
    ],
    swagger: {
      path: "/api-docs",
      spec: {
        securityDefinitions: {
          "auth:basic": {
            type: "basic"
          }
        }
      }
    }
  })
  export class Server extends ServerLoader {
    $beforeRoutesInit(): void | Promise<any> {
      this
        .use(GlobalAcceptMimesMiddleware)
        .use(cors())
        .use(cookieParser())
        .use(compress({}))
        .use(methodOverride())
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({
          extended: true
        }))
        .use(session({
          secret: "mysecretkey",
          resave: true,
          saveUninitialized: true,
          // maxAge: 36000,
          cookie: {
            path: "/",
            httpOnly: true,
            secure: false,
            maxAge: null
          }
        }));
  
      return null;
    }
  }