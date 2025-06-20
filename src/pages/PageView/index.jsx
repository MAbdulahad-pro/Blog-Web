import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PageView = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8080/blog-web/wordpress/wp-json/wp/v2/pages?slug=${slug}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setPage(data[0]);
                } else {
                    setPage(null);
                }
            });
    }, [slug]);

    if (!page) {
        return <div className="text-center py-20 text-gray-600">Page not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-indigo-700 mb-6">{page.title.rendered}</h1>
            <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
            />
        </div>
    );
};

export default PageView;
