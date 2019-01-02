const { Prisma } = require('prisma-binding')
const backup = require('./backup.json')

const db = new Prisma({
  typeDefs: 'api/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
  endpoint: process.env.PRISMA_ENDPOINT, // the endpoint of the Prisma API (value set in `.env`)
  debug: (process.env.NODE_ENV === 'production') ? false : true, // log all GraphQL queries & mutations sent to the Prisma API
  secret: process.env.PRISMA_SECRET, // only needed if specified in `database/prisma.yml` (value set in `.env`)
})
const seedConfig = {
  numberOfUsers: 200,
  // ...
}

const setup = async () => {
  // console.log('------>', backup)
  backup.users.map(user => {
    // "user_id": "1",
    // "username": "wmedeiros",
    // "password": "$2y$10$W0lOgFk535wpTBB.lYDkluUofIwEv0OBWA7WgFS6SGk9s6HjlyrNS",
    // "salutation": "",
    // "first_name": "wmedeiros",
    // "middle_name": "",
    // "last_name": "medeiros",
    // "suffix": null,
    // "gender": "",
    // "initials": "",
    // "email": "wesley.arquitetura@gmail.com",
    // "url": "",
    // "phone": "",
    // "fax": "",
    // "mailing_address": "",
    // "billing_address": null,
    // "country": "",
    // "locales": "",
    // "date_last_email": null,
    // "date_registered": "2016-05-18 17:32:30",
    // "date_validated": null,
    // "date_last_login": "2019-01-01 18:34:35",
    // "must_change_password": "0",
    // "auth_id": null,
    // "auth_str": null,
    // "disabled": "0",
    // "disabled_reason": null,
    // "inline_help": "0"
  })
  backup.authors.map(author => {
    backup.user_settings.map(authorSetting => {
      // "user_id": "6",
      // "assoc_id": "0",
      // "setting_value": "Programa de Pós-Graduação Mestrado em Desenvolvimento Regional da Universidade Federal do Amapá",
      // "setting_type": "string"
    })
    // create user
    await db.createUser({
      data: {
        "author_id": "2",
        "submission_id": "1",
        "primary_contact": "0",
        "seq": "2",
        "first_name": "Livia",
        "middle_name": "Teresinha Salomão",
        "last_name": "Piccinini",
        "suffix": null,
        "country": "",
        "email": "arq.alinecs@gmail.com",
        "url": "",
        "user_group_id": null
      }
    })
  })
  backup.issues.map(issue => {
    await db.mutation.createIssue({
      data: {
        "issue_id": "9",
        "journal_id": "1",
        "volume": "6",
        "number": "1",
        "year": "2018",
        "published": "1",
        "current": "0",
        "date_published": "2018-06-01 00:00:00",
        "date_notified": null,
        "last_modified": "2018-08-24 18:48:28",
        "access_status": "1",
        "open_access_date": null,
        "show_volume": "1",
        "show_number": "1",
        "show_year": "1",
        "show_title": "1",
        "style_file_name": null,
        "original_style_file_name": null
      },
    })
  })
  backup.citations.map(citation => {
    await db.mutation.createCitation({
      data: {
        "citation_id": "1",
        "assoc_type": "257",
        "citation_state": "4",
        "raw_citation": "BOURDIEU, P. O poder simbólico. Lisboa: DIFEL; Rio de Janeiro: Bertrand Brasil, 1989.",
        "seq": "1",
        "lock_id": null
      }
    })
  })
  backup.published_articles.map(publishedArticles => {
    console.log(publishedArticles)
    await db.mutation.createArticle({
      data: {
        "published_article_id": "1",
        "article_id": "2",
        "issue_id": "1",
        "date_published": "2016-05-31 00:00:28",
        "seq": "1",
        "access_status": "0"
      },
    })
  })
  backup.article_files.map(file => {
    // download pdf http://periodico.revistappc.com/index.php/RPPC/article/download/
    // upload file && create file
    await db.mutation.createFile({
      data: {
        "file_id": "1",
        "revision": "1",
        "source_file_id": null,
        "source_revision": null,
        "article_id": "1",
        "file_name": "1-1-1-SM.pdf",
        "file_type": "application/pdf",
        "file_size": "1691300",
        "original_file_name": "2-21-1-PB.pdf",
        "file_stage": "1",
        "viewable": null,
        "date_uploaded": "2016-05-25 14:34:33",
        "date_modified": "2016-05-25 14:34:33",
        "round": "1",
        "assoc_id": null
      }
    })
  })
  // backup.users
  backup.articles.map(article => {
    await db.mutation.createArticle({
      data: {
        "article_id": "97",
        "locale": "pt_BR",
        "user_id": "141",
        "journal_id": "1",
        "section_id": "1",
        "language": "pt",
        "comments_to_ed": "",
        "citations": "BEHRING, E. R; BOSCHETTI, I. Política Social: fundamentos e história.  São Paulo: Cortez, 2006, v. 2 (Biblioteca Básica do Serviço Social).\\r\\n\\r\\nBRASIL. Estatuto da Cidade. 3ª ed. Brasília: Edições Câmara, 2010.\\r\\n\\r\\n_____. Constituição da República Federativa do Brasil. 11 ed. São Paulo: Rideel, 2005 – (Coleção de leis Rideel. Série Compacta).\\r\\n\\r\\nFERREIRA, Ivanete Salete B., Políticas Sociais Setoriais por segmento – Assistência Social. In: CEAD. Capacitação em serviço social e política social: Módulo 3: Política Social. Brasília: CEAD, 2000. p.139-152.\\r\\n\\r\\nLEVEBVRE, Henri. A cidade do capital. Trad. Maria Helena Rauta Ramos e Marilena Jamur. Rio de Janeiro: DP&A, 1999.\\r\\n\\r\\nLOJKINE, Jean. O estado capitalista e a questão urbana. São Paulo: Martins Fontes, 1981.\\r\\n\\r\\n_______. Alternativas em face da mundialização: a instituição municipal. Mediação entre empresa e sociedade. In: RAMOS, Maria Helena R. (Org.). Metamorfoses sociais e políticas urbanas. Rio de Janeiro: DP & A, 2002. p. 21-34.\\r\\n\\r\\nMOTA, Ana Elizabete (Org.). O mito da assistência social – ensaios sobre Estado, Política e Sociedade. 2edª. São Paulo: Cortez, 2008.\\r\\n\\r\\nNETTO, José P. Crise do capital e consequências societárias. Revista Serviço Social e Sociedade. São Paulo: Cortez, n. 111, p.413-429, jul/set. 2012.\\r\\n\\r\\nPIAUÍ. Relatório Estadual Piauí. Teresina: Rede de Avaliação e Capacitação para Implementação dos Planos Diretores, 2009. \\r\\n\\r\\nPICOS. Plano Plurianual-PPA 2010-2013. Picos: Prefeitura Municipal, 2009, p. 59.\\r\\n\\r\\nPICOS. Lei Nº 2278/2008. Plano Diretor. Picos: Prefeitura Municipal, 2008.\\r\\n\\r\\nRAMOS, Maria H. Rauta. Políticas urbanas, conselhos locais e segregação socioespacial. In: RAMOS, Maria Helena R. (Org.). Metamorfoses sociais e políticas urbanas. Rio de Janeiro: DP & A, 2002. p. 133-150.\\r\\n\\r\\nRAMOS, Maria H. Rauta; BARBOSA, Maria José de S. Gestão de políticas urbanas e mecanismos de democracia direta. In: RAMOS, Maria Helena R. (Org.). Metamorfoses sociais e políticas urbanas. Rio de Janeiro: DP & A, 2002, p. 113-131. \\r\\n\\r\\nSPINK, M. J.; LIMA, H. Rigor e visibilidade: a explicitação dos passos da interpretação. In: SPINK, M. J. (org). Práticas discursivas e produção de sentido no cotidiano. São Paulo: Cortez, 2000, p.93-122.\\r\\n\\r\\nSOUZA, Marcelo Lopes de; RODRIGUES, Glauco Bruce. Planejamento Urbano e ativismos sociais. São Paulo: UNESP, 2004. \\r\\n\\r\\nVAINER, A.; ALBUQUERQUE, J.; GARSON, S. Plano Plurianual: passo a passo da elaboração do ppa para os municípios: manual de elaboração. Brasília: Ministério  do Desenvolvimento, Indústria e Comércio Exterior/BNDES, 2001. p. 87. \\r\\n\\r\\nVILLAÇA, Flávio. As ilusões do Plano Diretor. 2005 Disponível: 4shared.com/web/preview/pdf/NDhMsw8J. Acesso em: 10.08.2014",
        "date_submitted": "2017-01-22 13:25:30",
        "last_modified": "2017-04-10 09:54:15",
        "date_status_modified": "2017-04-10 09:54:15",
        "status": "0",
        "submission_progress": "0",
        "current_round": "1",
        "submission_file_id": "164",
        "revised_file_id": null,
        "review_file_id": "165",
        "editor_file_id": null,
        "pages": null,
        "fast_tracked": "0",
        "hide_author": "0",
        "comments_status": "0"
      }
    })
    console.log(article.article_id)
  })
  backup.notification_mail_list.map(subscription => {
    await db.mutation.createSubscription({
      data: {
        "notification_mail_list_id": "1",
        "email": "gabimeireles_@hotmail.com",
        "confirmed": "0",
        "token": "1890748177575fed2cadb92",
        "context": "1"
      },
    })
  })
  backup.site_settings.map(settings => {
    // {
    //   "setting_name": "title",
    //   "locale": "pt_BR",
    //   "setting_value": "REVISTA POLÍTICAS PÚBLICAS & CIDADES",
    //   "setting_type": "string"
    // },
  })
  // for (let index = 0; index < seedConfig.numberOfUsers; index++) {
  //   const user = await db.mutation.createUser(
  //     // ...
  //   )
  // }

  // ... seed other models, too
}

// Remember to call the setup method in the end
setup()
